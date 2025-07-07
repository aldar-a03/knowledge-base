package com.example.itsupport.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Добавление категории")
public class CategoryRequest {

    @Schema(description = "Название категории", example = "Сетевые технологии")
    @NotBlank(message = "Поле не может быть пустым")
    @Size(min = 4, max = 100, message = "Название категории должно содержать от 4 до 100 символов")
    private String name;
}
