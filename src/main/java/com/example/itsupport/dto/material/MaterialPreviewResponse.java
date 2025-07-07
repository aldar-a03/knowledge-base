package com.example.itsupport.dto.material;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaterialPreviewResponse {
    private Long id;
    private String title;
    private String previewText;
    private String authorName;
    private LocalDateTime createdAt;
}
