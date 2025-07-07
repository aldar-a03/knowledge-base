package com.example.itsupport.service;

import com.example.itsupport.entity.User;
import com.example.itsupport.entity.enums.Role;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.UserRepository;

import com.example.itsupport.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    @Transactional
    public void blockUser(Long targetId, CustomUserDetails admin) {
        User target = getUserOrThrow(targetId);

        if (target.getId().equals(admin.getId())) {
            throw new CustomException("Нельзя заблокировать самого себя", HttpStatus.FORBIDDEN);
        }

        if (isAdmin(target)) {
            throw new CustomException("Нельзя заблокировать администратора", HttpStatus.FORBIDDEN);
        }

        if (target.isBlocked()) return;

        target.setBlocked(true);
    }

    @Transactional
    public void unblockUser(Long targetId, CustomUserDetails admin) {
        User target = getUserOrThrow(targetId);

        if (target.getId().equals(admin.getId())) {
            throw new CustomException("Нельзя разблокировать самого себя", HttpStatus.FORBIDDEN);
        }

        target.setBlocked(false);
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ROLE_ADMIN;
    }
}
