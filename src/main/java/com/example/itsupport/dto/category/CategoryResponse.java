package com.example.itsupport.dto.category;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Schema(description = "Ответ с информацией о категории")
public class CategoryResponse {

    @Schema(description = "Идентификатор категории", example = "1")
    private Long id;

    @Schema(description = "Название категории", example = "Сетевые технологии")
    private String name;
}