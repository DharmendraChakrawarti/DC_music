package com.dcmusic.config;

import com.dcmusic.entity.User;
import com.dcmusic.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@dcmusic.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@dcmusic.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Pre-embedded Admin seeded! Username: admin@dcmusic.com | Password: admin");
        }
        
        if (!userRepository.existsByEmail("user@dcmusic.com")) {
            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("user@dcmusic.com");
            testUser.setPassword(passwordEncoder.encode("user"));
            testUser.setRole(User.Role.USER);
            userRepository.save(testUser);
            System.out.println("✅ Pre-embedded regular user seeded! Username: user@dcmusic.com | Password: user");
        }
    }
}
