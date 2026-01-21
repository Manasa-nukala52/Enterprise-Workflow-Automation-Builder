package com.enterprise.workflow.controller;

import com.enterprise.workflow.dto.CreateUserRequest;
import com.enterprise.workflow.dto.UpdateProfileRequest;
import com.enterprise.workflow.dto.UserDTO;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.repository.UserRepository;
import com.enterprise.workflow.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.enterprise.workflow.entity.Role;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String token) {
        String username = jwtService.extractUsername(token.substring(7));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UpdateProfileRequest request) {

        String username = jwtService.extractUsername(token.substring(7));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(UserDTO.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .fullName(updatedUser.getFullName())
                .role(updatedUser.getRole())
                .build());
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(u -> UserDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        userRepository.save(newUser);

        return ResponseEntity.ok("User created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }

        if (updates.containsKey("role")) {
            try {
                user.setRole(com.enterprise.workflow.entity.Role.valueOf((String) updates.get("role")));
            } catch (IllegalArgumentException e) {
                // ignore invalid role or throw
            }
        }

        if (updates.containsKey("password") && updates.get("password") != null
                && !((String) updates.get("password")).isBlank()) {
            user.setPassword(passwordEncoder.encode((String) updates.get("password")));
        }

        userRepository.save(user);

        return ResponseEntity.ok(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
