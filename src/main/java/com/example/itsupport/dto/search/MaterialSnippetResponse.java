package com.example.itsupport.dto.search;

import java.time.LocalDateTime;

public record MaterialSnippetResponse(
        Long id,
        String title,
        String snippet,
        String authorName,
        LocalDateTime createdAt
) {}
