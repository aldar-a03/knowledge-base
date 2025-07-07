package com.example.itsupport.dto.material;

import com.example.itsupport.dto.attachment.AttachmentDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@Schema(description = "Ответ при получении информации о материале")
public class MaterialResponse {

    @Schema(description = "Идентификатор материала")
    private Long id;

    @Schema(description = "Заголовок материала")
    private String title;

    @Schema(description = "Содержимое материала")
    private String content;

    @Schema(description = "Имя автора")
    private String authorName;

    @Schema(description = "ID автора материала")
    private Long authorId;

    @Schema(description = "Дата создания материала")
    private LocalDateTime createdAt;

    @Schema(description = "Список названий категорий, к которым относится материал")
    private List<String> categoryNames;

    private LocalDateTime updatedAt;

    private List<AttachmentDto> attachments;
}
