package com.example.itsupport.service;

import com.example.itsupport.dto.attachment.AttachmentDto;
import com.example.itsupport.dto.material.MaterialPreviewResponse;
import com.example.itsupport.dto.material.MaterialRequest;
import com.example.itsupport.dto.material.MaterialResponse;
import com.example.itsupport.dto.search.MaterialSnippetResponse;
import com.example.itsupport.dto.search.SearchPageResponse;
import com.example.itsupport.entity.Category;
import com.example.itsupport.entity.History;
import com.example.itsupport.entity.Material;
import com.example.itsupport.entity.User;
import com.example.itsupport.entity.enums.Role;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.*;
import com.example.itsupport.security.CustomUserDetails;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.jsoup.Jsoup;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final AttachmentRepository attachmentRepository;


    public MaterialResponse createMaterial(MaterialRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Пользователь не найден", HttpStatus.NOT_FOUND));

        // Получаем категорию
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        if (categories.isEmpty()) {
            throw new CustomException("Категория не найдена", HttpStatus.NOT_FOUND);
        }

        // Создаем сущность материала
        Material material = Material.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .user(user)
                .timeInsert(LocalDateTime.now())
                .categories(categories)
                .build();

        Material saved = materialRepository.save(material);

        return MaterialResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .content(saved.getContent())
                .createdAt(saved.getTimeInsert())
                .authorName(saved.getUser().getFullName())
                .authorId(material.getUser().getId())
                .categoryNames(saved.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()))
                .build();
    }


    public List<MaterialResponse> getAllMaterials() {
        List<Material> materials = materialRepository.findAll();

        return materials.stream()
                .map(material -> MaterialResponse.builder()
                        .id(material.getId())
                        .title(material.getTitle())
                        .content(material.getContent())
                        .createdAt(material.getTimeInsert())
                        .updatedAt(material.getUpdatedAt())
                        .authorName(material.getUser().getFullName())
                        .categoryNames(material.getCategories().stream()
                                .map(Category::getName)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }


    public MaterialResponse updateMaterial(Long materialId, MaterialRequest request, CustomUserDetails userDetails)
    {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new EntityNotFoundException("Материал не найден"));

        Long currentUserId = userDetails.getId();
        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;
        boolean isAuthor = material.getUser().getId().equals(currentUserId);

        if (!isAuthor && !isAdmin) {
            throw new CustomException("Редактировать материал может только автор или администратор", HttpStatus.FORBIDDEN);
        }

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        if (categories.isEmpty()) {
            throw new CustomException("Категория не найдена", HttpStatus.NOT_FOUND);
        }

        material.setTitle(request.getTitle());
        material.setContent(request.getContent());
        material.setCategories(categories);
        material.setUpdatedAt(LocalDateTime.now());

        materialRepository.save(material);

        History history = History.builder()
                .material(material)
                .user(material.getUser())
                .build();
        historyRepository.save(history);

        return MaterialResponse.builder()
                .id(material.getId())
                .title(material.getTitle())
                .content(material.getContent())
                .createdAt(material.getTimeInsert())
                .updatedAt(material.getUpdatedAt())
                .authorName(material.getUser().getFullName())
                .categoryNames(categories.stream().map(Category::getName).collect(Collectors.toList()))
                .build();
    }


    public SearchPageResponse search(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Object[]> raw = materialRepository.fullTextSearch(q, pageable);
        if (!raw.isEmpty()) {
            Page<MaterialSnippetResponse> items = raw.map(this::mapRow);
            return new SearchPageResponse(
                    items.getContent(),
                    items.getNumber(),
                    items.getTotalPages(),
                    items.getTotalElements(),
                    null
            );
        }

        // подсказка
        String[] tokens = q.split("\\s+");
        List<String> corrected = new ArrayList<>();

        for (String token : tokens) {
            String suggestion = materialRepository.suggestClosest(token);
            corrected.add(suggestion != null ? suggestion : token);
        }

        String correctedQuery = String.join(" ", corrected);
        return new SearchPageResponse(
                List.of(),
                page, 0, 0,
                correctedQuery.equals(q) ? null : correctedQuery
        );
    }


    private MaterialSnippetResponse mapRow(Object[] row) {
        Long id            = ((Number) row[0]).longValue();
        String title       = (String) row[1];
        String snippet     = (String) row[2];
        String authorName  = (String) row[3];
        LocalDateTime at   = ((Timestamp) row[4]).toLocalDateTime();
        return new MaterialSnippetResponse(id, title, snippet, authorName, at);
    }



    private String shorten(String content, int maxLen) {
        if (content == null) return "";
        String plainText = Jsoup.parse(content).text();
        return plainText.length() <= maxLen ? plainText : plainText.substring(0, maxLen) + "...";
    }



    public void deleteMaterial(Long materialId, CustomUserDetails userDetails) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new CustomException("Материал не найден", HttpStatus.NOT_FOUND));

        Long currentUserId = userDetails.getId();
        boolean isAdmin = userDetails.getRole() == Role.ROLE_ADMIN;
        boolean isAuthor = material.getUser().getId().equals(currentUserId);

        if (!isAuthor && !isAdmin) {
            throw new CustomException("Удалять материал может только автор или администратор", HttpStatus.FORBIDDEN);
        }

        materialRepository.delete(material);
    }

    public MaterialResponse getMaterialById(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new CustomException("Материал не найден", HttpStatus.NOT_FOUND));

        List<AttachmentDto> attachments = attachmentRepository.findByMaterialId(id)
                .stream()
                .map(AttachmentDto::from)
                .toList();

        return MaterialResponse.builder()
                .id(material.getId())
                .title(material.getTitle())
                .content(material.getContent())
                .createdAt(material.getTimeInsert())
                .updatedAt(material.getUpdatedAt())
                .authorName(material.getUser().getFullName())
                .authorId(material.getUser().getId())
                .categoryNames(material.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()))
                .attachments(attachments)
                .build();
    }


    public Page<MaterialPreviewResponse> getMaterialsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeInsert").descending());
        Page<Material> materials = materialRepository.findByCategories_Id(categoryId, pageable);

        return materials.map(material -> new MaterialPreviewResponse(
                material.getId(),
                material.getTitle(),
                shorten(material.getContent(), 250),
                material.getUser().getFullName(),
                material.getTimeInsert()
        ));
    }

    public Page<MaterialPreviewResponse> getMaterialsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeInsert").descending());
        Page<Material> materials = materialRepository.findByUserId(userId, pageable);

        return materials.map(material -> new MaterialPreviewResponse(
                material.getId(),
                material.getTitle(),
                shorten(material.getContent(), 250),
                material.getUser().getFullName(),
                material.getTimeInsert()
        ));
    }

}
