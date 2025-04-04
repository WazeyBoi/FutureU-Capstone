package edu.cit.futureu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.service.UserService;

@RestController
@RequestMapping(method=RequestMethod.GET, path="/api/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/test")
    public String test() {
        return "User API is working!";
    }

    // CREATE
    @PostMapping("/postUserRecord")
    public UserEntity postUserRecord(@RequestBody UserEntity user) {
        return userService.createUser(user);
    }
    
    // READ
    @GetMapping("/getAllUsers")
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }
    
    // Get user by ID
    @GetMapping("/getUser/{userId}")
    public UserEntity getUserById(@PathVariable int userId) {
        return userService.getUserById(userId)
                .orElse(null);
    }
    
    // Get user by email
    @GetMapping("/getUserByEmail")
    public UserEntity getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }
    
    // UPDATE
    @PutMapping("/putUserDetails")
    public UserEntity putUserDetails(@RequestParam int userId, @RequestBody UserEntity newUserDetails) {
        newUserDetails.setUserId(userId);
        return userService.updateUser(newUserDetails);
    }
    
    // DELETE
    @DeleteMapping("/deleteUserDetails/{userId}")
    public String deleteUser(@PathVariable int userId) {
        boolean deleted = userService.deleteUser(userId);
        return deleted ? "User with ID " + userId + " successfully deleted" : "User with ID " + userId + " not found";
    }
}
