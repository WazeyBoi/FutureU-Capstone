// Test file for statistics service - remove this after testing
import statisticsService from './statisticsService.js';

const testStatistics = async () => {
  // console.log('Testing statistics service...');
  
  try {
    const stats = await statisticsService.getAllStatistics();
    // console.log('Statistics:', stats);
  } catch (error) {
    console.error('Error testing statistics:', error);
  }
};

// Uncomment the line below to test
// testStatistics();

export default testStatistics;