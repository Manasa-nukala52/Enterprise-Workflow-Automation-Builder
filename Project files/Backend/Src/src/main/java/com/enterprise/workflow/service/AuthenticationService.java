package com.enterprise.workflow.service;

import com.enterprise.workflow.config.JwtService;
import com.enterprise.workflow.dto.AuthenticationRequest;
import com.enterprise.workflow.dto.AuthenticationResponse;
import com.enterprise.workflow.dto.RegisterRequest;
import com.enterprise.workflow.entity.Role;
import com.enterprise.workflow.entity.User;
import com.enterprise.workflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.enterprise.workflow.service.AuditLogService;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final AuditLogService auditLogService;

        public AuthenticationResponse register(RegisterRequest request) {
                var user = User.builder()
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .fullName(request.getFullName())
                                .role(request.getRole() != null ? request.getRole() : Role.USER)
                                .build();
                repository.save(user); // Add specific error handling for duplicate user

                auditLogService.log("USER_REGISTER", user, "User registered with role: " + user.getRole());

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", user.getRole());

                var jwtToken = jwtService.generateToken(claims, user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .username(user.getUsername())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();

                auditLogService.log("USER_LOGIN", user, "User logged in successfully.");

                Map<String, Object> claims = new HashMap<>();
                claims.put("role", user.getRole());

                var jwtToken = jwtService.generateToken(claims, user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .username(user.getUsername())
                                .build();
        }
}
