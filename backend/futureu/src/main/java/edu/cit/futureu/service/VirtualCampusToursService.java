package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.cit.futureu.entity.VirtualCampusToursEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.repository.VirtualCampusToursRepository;

@Service
public class VirtualCampusToursService {

    @Autowired
    private VirtualCampusToursRepository virtualCampusTourRepository;

    private static final int FEATURED_THRESHOLD = 1000;

    public VirtualCampusToursEntity createTour(VirtualCampusToursEntity tour) {
        return virtualCampusTourRepository.save(tour);
    }

    public List<VirtualCampusToursEntity> getAllTours() {
        return virtualCampusTourRepository.findAll();
    }

    public Optional<VirtualCampusToursEntity> getTourById(int id) {
        return virtualCampusTourRepository.findById(id);
    }

    public List<VirtualCampusToursEntity> getToursBySchool(SchoolEntity school) {
        return virtualCampusTourRepository.findBySchool(school);
    }

    public VirtualCampusToursEntity updateTour(VirtualCampusToursEntity tour) {
        return virtualCampusTourRepository.save(tour);
    }

    public void deleteTour(int id) {
        virtualCampusTourRepository.deleteById(id);
    }

    // Increment views and auto-feature if threshold is reached
    public Optional<VirtualCampusToursEntity> incrementViews(int id) {
        Optional<VirtualCampusToursEntity> tourOpt = virtualCampusTourRepository.findById(id);
        if (tourOpt.isPresent()) {
            VirtualCampusToursEntity tour = tourOpt.get();
            tour.setViews(tour.getViews() + 1);
            if (tour.getViews() >= FEATURED_THRESHOLD) {
                tour.setFeatured(true);
            }
            virtualCampusTourRepository.save(tour);
            return Optional.of(tour);
        }
        return Optional.empty();
    }

    // Admin manual override for featured status
    public Optional<VirtualCampusToursEntity> setFeatured(int id, boolean featured) {
        Optional<VirtualCampusToursEntity> tourOpt = virtualCampusTourRepository.findById(id);
        if (tourOpt.isPresent()) {
            VirtualCampusToursEntity tour = tourOpt.get();
            tour.setFeatured(featured);
            virtualCampusTourRepository.save(tour);
            return Optional.of(tour);
        }
        return Optional.empty();
    }
}