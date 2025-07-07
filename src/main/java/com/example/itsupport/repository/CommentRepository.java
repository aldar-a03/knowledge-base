package com.example.itsupport.repository;

import com.example.itsupport.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByMaterialIdOrderByCreatedAtDesc(Long materialId);

    long countByUserId(Long userId);
}