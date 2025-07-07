package com.example.itsupport.dto.comment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@Schema(description = "Комментарий к материалу")
public class CommentResponse {

    @Schema(description = "ID комментария", example = "5")
    private Long id;

    @Schema(description = "Текст комментария", example = "Спасибо, помогло!")
    private String text;

    @Schema(description = "Дата и время публикации комментария")
    private LocalDateTime createdAt;

    @Schema(description = "Автор комментария", example = "Иванов Иван Иванович")
    private String authorName;

    @Builder.Default
    private boolean isAuthor = false;

    @Builder.Default
    private boolean isAdmin = false;
}