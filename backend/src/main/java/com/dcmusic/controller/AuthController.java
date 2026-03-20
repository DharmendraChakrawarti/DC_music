package com.dcmusic.controller;

import com.dcmusic.dto.AuthRequest;
import com.dcmusic.dto.RegisterRequest;
import com.dcmusic.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
         try {
            return ResponseEntity.ok(authService.authenticate(request));
         } catch (Exception e) {
             return ResponseEntity.badRequest().body("Invalid credentials");
         }
    }
}
