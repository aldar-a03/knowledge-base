package com.example.itsupport.service;

import com.example.itsupport.dto.attachment.ResourceWithMeta;
import com.example.itsupport.entity.Attachment;
import com.example.itsupport.entity.Material;
import com.example.itsupport.exception.CustomException;
import com.example.itsupport.repository.AttachmentRepository;
import com.example.itsupport.repository.MaterialRepository;
import com.example.itsupport.storage.FileStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {
    private final AttachmentRepository repo;
    private final MaterialRepository materialRepo;
    private final FileStorage storage;

    public Attachment upload(Long materialId, MultipartFile file) {
        Material material = materialRepo.getReferenceById(materialId);

        if (!List.of("image/png","image/jpeg","application/pdf").contains(file.getContentType()))
            throw new CustomException("Тип файла не поддерживается", HttpStatus.BAD_REQUEST);
        if (file.getSize() > 5 * 1024 * 1024)
            throw new CustomException("Файл >5 МБ", HttpStatus.BAD_REQUEST);

        try {
            String key = storage.store(file, materialId.toString());
            Attachment att = Attachment.builder()
                    .material(material)
                    .path(key)
                    .originalName(file.getOriginalFilename())
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .createdAt(Instant.now())
                    .build();
            return repo.save(att);
        } catch (IOException io) {
            throw new CustomException("Ошибка файлового хранилища",
                    HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    @Transactional(readOnly = true)
    public ResourceWithMeta download(UUID id) {
        Attachment att = repo.findById(id)
                .orElseThrow(() ->
                        new CustomException("Файл не найден",
                                HttpStatus.NOT_FOUND));
        try {
            Resource res = storage.loadAsResource(att.getPath());
            return new ResourceWithMeta(res, att);
        } catch (IOException io) {
            throw new CustomException("Не удалось прочитать файл",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public String deleteAttachment(UUID id) {
        Attachment att = repo.findById(id)
                .orElseThrow(() -> new CustomException("Файл не найден", HttpStatus.NOT_FOUND));
        try {
            storage.delete(att.getPath()); // удаление из хранилища
            repo.delete(att);              // удаление из БД
            return "Файл успешно удалён";
        } catch (IOException e) {
            throw new CustomException("Ошибка удаления файла", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
