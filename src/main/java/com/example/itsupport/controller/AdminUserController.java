package com.example.itsupport.controller;

import com.example.itsupport.security.CustomUserDetails;
import com.example.itsupport.service.AdminService;
import com.example.itsupport.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminService adminService;

    @PatchMapping("/{id}/block")
    public ResponseEntity<String> block(@PathVariable Long id,
                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        adminService.blockUser(id, currentUser);
        return ResponseEntity.ok("Пользователь заблокирован");
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<Void> unblock(@PathVariable Long id,
                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        adminService.unblockUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
