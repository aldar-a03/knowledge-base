package com.example.itsupport.controller;

import com.example.itsupport.dto.comment.CommentRequest;
import com.example.itsupport.dto.comment.CommentResponse;
import com.example.itsupport.security.CustomUserDetails;
import com.example.itsupport.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Комментарии", description = "Управление комментариями к материалам")
public class CommentController {

    private final CommentService commentService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    @Operation(summary = "Добавить комментарий")
    public ResponseEntity<CommentResponse> addComment(@Valid @RequestBody CommentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails)
    {
        CommentResponse response = commentService.addComment(request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/material/{materialId}")
    @Operation(summary = "Получить комментарии к материалу")
    public ResponseEntity<List<CommentResponse>> getCommentsByMaterial(@PathVariable Long materialId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(commentService.getCommentsByMaterialId(materialId, userDetails));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Удалить комментарий")
    public ResponseEntity<String> deleteComment( @PathVariable Long commentId, @AuthenticationPrincipal CustomUserDetails userDetails)
    {
        commentService.deleteComment(commentId, userDetails);
        return ResponseEntity.ok("Комментарий успешно удален");
    }
}