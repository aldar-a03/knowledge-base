package com.example.itsupport.service;

import com.example.itsupport.dto.category.CategoryRequest;
import com.example.itsupport.dto.category.CategoryResponse;
import com.example.itsupport.entity.Category;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repository;

    public CategoryResponse create(CategoryRequest request) {
        if (repository.existsByName(request.getName())) {
            throw new CustomException("Категория с таким названием уже существует", HttpStatus.BAD_REQUEST);
        }

        Category category = repository.save(
                Category.builder().name(request.getName()).build()
        );

        return new CategoryResponse(category.getId(), category.getName());
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CustomException("Категория не найдена", HttpStatus.BAD_REQUEST);
        }
        repository.deleteById(id);
    }

    public List<CategoryResponse> getAllCategories() {
        return repository.findAll().stream()
                .map(category -> new CategoryResponse(
                        category.getId(),
                        category.getName()
                ))
                .collect(Collectors.toList());
    }

}
