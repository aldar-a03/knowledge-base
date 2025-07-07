package com.example.itsupport.controller;

import com.example.itsupport.dto.material.MaterialPreviewResponse;
import com.example.itsupport.dto.material.MaterialRequest;
import com.example.itsupport.dto.material.MaterialResponse;
import com.example.itsupport.dto.search.MaterialSnippetResponse;
import com.example.itsupport.dto.search.SearchPageResponse;
import com.example.itsupport.security.CustomUserDetails;
import com.example.itsupport.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
@Tag(name = "Материалы", description = "Управление материалами")
public class MaterialController {

    private final MaterialService materialService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    @Operation(summary = "Создать новый материал")
    public ResponseEntity<MaterialResponse> createMaterial( @Valid @RequestBody MaterialRequest request, @AuthenticationPrincipal CustomUserDetails userDetails)
    {
        Long userId = userDetails.getId();
        MaterialResponse response = materialService.createMaterial(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Получить список всех материалов")
    public ResponseEntity<List<MaterialResponse>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @Operation(summary = "Редактировать материал")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable Long id,
            @Valid @RequestBody MaterialRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MaterialResponse response = materialService.updateMaterial(id, request, userDetails);
        return ResponseEntity.ok(response);
    }


    @Operation(summary = "Найти материал")
    @GetMapping("/search")
    public SearchPageResponse searchMaterials(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return materialService.search(keyword, page, size);
    }


    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить материал")
    public ResponseEntity<String> deleteMaterial(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean confirm,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails)
    {
        if (!confirm) {
            return ResponseEntity.badRequest().body("Требуется подтверждение удаления (confirm=true)");
        }

        materialService.deleteMaterial(id, userDetails);
        return ResponseEntity.ok("Материал успешно удален");
    }


    @GetMapping("/{id}")
    @Operation(summary = "Получить материал по ID")
    public ResponseEntity<MaterialResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @Operation(summary = "Получить материал по категории")
    @GetMapping("/by-category/{categoryId}")
    public Page<MaterialPreviewResponse> getMaterialsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return materialService.getMaterialsByCategory(categoryId, page, size);
    }

    @Operation(summary = "Получить материалы пользователя")
    @GetMapping("/user/{userId}")
    public Page<MaterialPreviewResponse> getMaterialsByUser(@PathVariable Long userId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        return materialService.getMaterialsByUser(userId, page, size);
    }


}
