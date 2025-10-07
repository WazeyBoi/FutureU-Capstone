package edu.cit.futureu.service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;

@Service
public class RequestPriorityService {
    
    private final BlockingQueue<PriorityRequest> requestQueue = new PriorityBlockingQueue<>();
    private final Map<String, CompletableFuture<String>> pendingRequests = new ConcurrentHashMap<>();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private volatile boolean isProcessing = false;
    
    public enum Priority {
        HIGH(1),    // Top 3 career/program recommendations
        MEDIUM(2),  // Secondary recommendations
        LOW(3);     // Background/less important requests
        
        private final int value;
        Priority(int value) { this.value = value; }
        public int getValue() { return value; }
    }
    
    public static class PriorityRequest implements Comparable<PriorityRequest> {
        private final String requestId;
        private final Priority priority;
        private final Runnable task;
        private final long timestamp;
        
        public PriorityRequest(String requestId, Priority priority, Runnable task) {
            this.requestId = requestId;
            this.priority = priority;
            this.task = task;
            this.timestamp = System.currentTimeMillis();
        }
        
        @Override
        public int compareTo(PriorityRequest other) {
            // Higher priority (lower number) comes first
            int priorityComparison = Integer.compare(this.priority.getValue(), other.priority.getValue());
            if (priorityComparison != 0) {
                return priorityComparison;
            }
            // If same priority, FIFO (first in, first out)
            return Long.compare(this.timestamp, other.timestamp);
        }
        
        public String getRequestId() { return requestId; }
        public Priority getPriority() { return priority; }
        public Runnable getTask() { return task; }
    }
    
    /**
     * Submit a request for AI processing with priority
     */
    public CompletableFuture<String> submitRequest(String requestId, Priority priority, Supplier<String> task) {
        CompletableFuture<String> future = new CompletableFuture<>();
        pendingRequests.put(requestId, future);
        
        PriorityRequest request = new PriorityRequest(requestId, priority, () -> {
            try {
                String result = task.get();
                future.complete(result);
            } catch (Exception e) {
                future.completeExceptionally(e);
            } finally {
                pendingRequests.remove(requestId);
            }
        });
        
        requestQueue.offer(request);
        startProcessingIfNeeded();
        
        return future;
    }
    
    /**
     * Start processing requests if not already running
     */
    private synchronized void startProcessingIfNeeded() {
        if (!isProcessing) {
            isProcessing = true;
            executor.submit(this::processRequests);
        }
    }
    
    /**
     * Process requests from the queue with proper rate limiting
     */
    private void processRequests() {
        try {
            while (!requestQueue.isEmpty()) {
                PriorityRequest request = requestQueue.take(); // Blocks until available
                
                System.out.println("🔄 Processing " + request.getPriority() + " priority request: " + request.getRequestId());
                request.getTask().run();
                
                // Small delay between requests to respect rate limits
                Thread.sleep(1000); // 1 second between requests
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            synchronized (this) {
                isProcessing = false;
            }
        }
    }
    
    /**
     * Get current queue status for monitoring
     */
    public Map<String, Object> getQueueStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("queueSize", requestQueue.size());
        status.put("pendingRequests", pendingRequests.size());
        status.put("isProcessing", isProcessing);
        
        // Group by priority
        Map<Priority, Integer> priorityCounts = new HashMap<>();
        for (PriorityRequest request : requestQueue) {
            priorityCounts.merge(request.getPriority(), 1, Integer::sum);
        }
        status.put("priorityCounts", priorityCounts);
        
        return status;
    }
    
    /**
     * Clear all pending requests (emergency stop)
     */
    public void clearQueue() {
        requestQueue.clear();
        pendingRequests.values().forEach(future -> 
            future.completeExceptionally(new InterruptedException("Queue cleared")));
        pendingRequests.clear();
    }
}