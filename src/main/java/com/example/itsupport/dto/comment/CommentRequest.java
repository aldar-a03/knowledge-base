package com.example.itsupport.dto.comment;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Запрос на добавление комментария")
public class CommentRequest {

    @NotNull(message = "ID материала не может быть пустым")
    @Schema(description = "ID материала, к которому оставлен комментарий", example = "1")
    private Long materialId;

    @NotBlank(message = "Текст комментария не может быть пустым")
    @Size(max = 140, message = "Максимальная длина комментария — 140 символов")
    @Schema(description = "Текст комментария", example = "Очень полезный материал!")
    private String text;
}