package com.example.itsupport.controller;

import com.example.itsupport.dto.user.*;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.security.CustomUserDetails;
import com.example.itsupport.service.PasswordService;
import com.example.itsupport.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Пользователь", description = "Управление пользователем")
public class UserController {

    private final UserService userService;
    private final PasswordService passwordService;

    @Operation(summary = "Получить профиль пользователя")
    @GetMapping("/{id}")
    public UserProfileResponse getUserProfile(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails currentUser) {

        return userService.getUserProfile(id, currentUser.getId());
    }


    @Operation(summary = "Получить список пользователей (с поиском по ключевому слову)")
    @GetMapping("/search")
    public List<UserSearchResponse> searchUsers(
            @RequestParam(name = "keyword", required = false, defaultValue = "") String keyword
    ) {
        return userService.searchUsers(keyword);
    }


    @Operation(summary = "Изменить роль пользователя")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        userService.updateUserRole(id, request.getNewRole(), currentUser.getId());
        return ResponseEntity.ok().build();
    }


    @Operation(summary = "Изменить имя пользователя")
    @PutMapping("/{id}/name")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updateUsername(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUsernameRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        userService.updateUsername(id, currentUser.getId(), request.getFullName());
        return ResponseEntity.ok().build();
    }


    @Operation(summary = "Сменить пароль")
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        if (!id.equals(currentUser.getId())) {
            throw new CustomException("Можно сменить только свой пароль", HttpStatus.FORBIDDEN);
        }

        passwordService.changePassword(id, request);
        return ResponseEntity.ok().build();
    }

}

