package com.example.itsupport.dto.search;

import java.util.List;

public record SearchPageResponse(
        List<MaterialSnippetResponse> items,
        int  page,
        int  totalPages,
        long totalElements,
        String suggestion          // null, если материалы нашлись
) {}
