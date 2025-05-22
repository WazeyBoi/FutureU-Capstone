package edu.cit.futureu.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import edu.cit.futureu.entity.VirtualCampusToursEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.service.VirtualCampusToursService;
import edu.cit.futureu.service.SchoolService;

@RestController
@RequestMapping("/api/virtualcampustours")
public class VirtualCampusToursController {

    @Autowired
    private VirtualCampusToursService virtualCampusTourService;

    @Autowired
    private SchoolService schoolService;

    @PostMapping("/create")
    public VirtualCampusToursEntity createTour(@RequestBody VirtualCampusToursEntity tour) {
        return virtualCampusTourService.createTour(tour);
    }

    @GetMapping("/getAllVirtualCampousTours")
    public List<VirtualCampusToursEntity> getAllTours() {
        return virtualCampusTourService.getAllTours();
    }

    @GetMapping("/{id}")
    public VirtualCampusToursEntity getTourById(@PathVariable int id) {
        return virtualCampusTourService.getTourById(id).orElse(null);
    }

    @GetMapping("/bySchool/{schoolId}")
    public List<VirtualCampusToursEntity> getToursBySchool(@PathVariable int schoolId) {
        Optional<SchoolEntity> school = schoolService.getSchoolById(schoolId);
        return school.map(virtualCampusTourService::getToursBySchool).orElse(List.of());
    }

    @PutMapping("/update/{id}")
    public VirtualCampusToursEntity updateTour(@PathVariable int id, @RequestBody VirtualCampusToursEntity tour) {
        tour.setVirtualCampusTourId(id);
        return virtualCampusTourService.updateTour(tour);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteTour(@PathVariable int id) {
        virtualCampusTourService.deleteTour(id);
    }

    @PutMapping("/{id}/view")
    public VirtualCampusToursEntity incrementViews(@PathVariable int id) {
        return virtualCampusTourService.incrementViews(id).orElse(null);
    }

    @PutMapping("/{id}/feature")
    public VirtualCampusToursEntity setFeatured(@PathVariable int id, @RequestParam boolean featured) {
        return virtualCampusTourService.setFeatured(id, featured).orElse(null);
    }
}