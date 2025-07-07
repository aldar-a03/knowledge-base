package com.example.itsupport.dto.material;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Добавление материала")
public class MaterialRequest {

    @NotBlank(message = "Заголовок не может быть пустым")
    @Size(min = 10, max = 100, message = "Заголовок должен содержать от 10 до 100 символов")
    private String title;

    @NotBlank(message = "Текст не может быть пустым")
    @Size(min = 50, message = "Минимальная длина текста 50 символов")
    private String content;

    @Schema(description = "Список ID категорий, выбранных пользователем")
    @NotEmpty(message = "Необходимо выбрать хотя бы одну категорию")
    private List<Long> categoryIds;
}
