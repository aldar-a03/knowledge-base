package com.example.itsupport.service;

import com.example.itsupport.dto.user.UserProfileResponse;
import com.example.itsupport.dto.user.UserSearchResponse;
import com.example.itsupport.entity.User;
import com.example.itsupport.entity.enums.Role;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.CommentRepository;
import com.example.itsupport.repository.MaterialRepository;
import com.example.itsupport.repository.UserRepository;
import com.example.itsupport.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.itsupport.dto.user.UserProfileResponse;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final MaterialRepository materialRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;


    /**
     * Сохранение пользователя
     *
     * @return сохраненный пользователь
     */
    public User save(User user) {
        return repository.save(user);
    }


    /**
     * Создание пользователя
     *
     * @return созданный пользователь
     */
    public User create(User user) {
        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        return save(user);
    }

    /**
     * Получение пользователя по имени пользователя
     *
     * @return пользователь
     */
    public User getByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));
    }


    /**
     * Получение пользователя по имени пользователя
     * <p>
     * Нужен для Spring Security
     *
     * @return пользователь
     */
    public UserDetailsService userDetailsService() {
        return email -> {
            User user = getByEmail(email);
            return CustomUserDetails.fromUser(user);
        };
    }

    /**
     * Получение текущего пользователя
     *
     * @return текущий пользователь
     */
    public User getCurrentUser() {
        // Получение имени пользователя из контекста Spring Security
        var email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getByEmail(email);
    }


    /**
     * Выдача прав администратора текущему пользователю
     * <p>
     * Нужен для демонстрации
     */
    @Deprecated
    public void getAdmin() {
        var user = getCurrentUser();
        user.setRole(Role.ROLE_ADMIN);
        save(user);
    }

    public UserProfileResponse getUserProfile(Long id, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));

        boolean isCurrentUser = id.equals(currentUserId);

        long materialCount = materialRepository.countByUserId(id);
        long commentCount = commentRepository.countByUserId(id);

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .registeredAt(user.getTimeInsert())
                .materialCount(materialCount)
                .commentCount(commentCount)
                .blocked(user.isBlocked())
                .build();
    }


    public List<UserSearchResponse> searchUsers(String keyword) {
        List<User> users;

        if (keyword == null || keyword.isBlank()) {
            // Если нет ключевого слова — берем всех по алфавиту
            users = userRepository.findAllByOrderByUsernameAsc();
        } else {
            // Иначе — по поиску (можно дополнительно сортировать результат по fullname)
            users = userRepository
                    .searchByUsernameOrEmail(keyword)
                    .stream()
                    .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                    .toList();
        }

        return users.stream()
                .map(u -> UserSearchResponse.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .build())
                .toList();
    }

    public void updateUserRole(Long targetUserId, Role newRole, Long currentUserId) {
        if (targetUserId.equals(currentUserId)) {
            throw new CustomException("Нельзя изменить свою собственную роль", HttpStatus.FORBIDDEN);
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));

        user.setRole(newRole);
        userRepository.save(user);
    }

    public void updateUsername(Long userId, Long currentUserId, String newFullName) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("Текущий пользователь не найден", HttpStatus.NOT_FOUND));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isSelf = userId.equals(currentUserId);

        if (!isSelf && !isAdmin) {
            throw new CustomException("Недостаточно прав для изменения имени", HttpStatus.FORBIDDEN);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));

        user.setUsername(newFullName);
        userRepository.save(user);
    }



}
