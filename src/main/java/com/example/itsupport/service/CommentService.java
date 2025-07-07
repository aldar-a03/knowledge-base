package com.example.itsupport.service;

import com.example.itsupport.dto.comment.CommentRequest;
import com.example.itsupport.dto.comment.CommentResponse;
import com.example.itsupport.entity.Comment;
import com.example.itsupport.entity.Material;
import com.example.itsupport.entity.User;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.CommentRepository;
import com.example.itsupport.repository.MaterialRepository;
import com.example.itsupport.repository.UserRepository;
import com.example.itsupport.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final MaterialRepository materialRepository;

    public CommentResponse addComment(CommentRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));

        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new CustomException("Материал не найден", HttpStatus.NOT_FOUND));

        Comment comment = Comment.builder()
                .user(user)
                .material(material)
                .text(request.getText())
                .createdAt(LocalDateTime.now())
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentResponse.builder()
                .id(saved.getId())
                .text(saved.getText())
                .createdAt(saved.getCreatedAt())
                .authorName(saved.getUser().getFullName())
                .build();
    }


    public List<CommentResponse> getCommentsByMaterialId(Long materialId, CustomUserDetails userDetails) {
        Long currentUserId = userDetails.getId();
        boolean isAdmin = userDetails.getRole().name().equals("ROLE_ADMIN");

        List<Comment> comments = commentRepository.findByMaterialIdOrderByCreatedAtDesc(materialId);

        return comments.stream()
                .map(comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .text(comment.getText())
                        .createdAt(comment.getCreatedAt())
                        .authorName(comment.getUser().getFullName())
                        .isAuthor(comment.getUser().getId().equals(currentUserId))
                        .isAdmin(isAdmin)
                        .build())
                .collect(Collectors.toList());
    }


    public void deleteComment(Long commentId, CustomUserDetails userDetails) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException("Комментарий не найден", HttpStatus.NOT_FOUND));

        Long currentUserId = userDetails.getId();
        boolean isAdmin = userDetails.getRole().name().equals("ROLE_ADMIN");
        boolean isAuthor = comment.getUser().getId().equals(currentUserId);

        if (!isAuthor && !isAdmin) {
            throw new CustomException("Удалить комментарий может только автор или администратор", HttpStatus.FORBIDDEN);
        }

        commentRepository.delete(comment);
    }
}