package com.example.itsupport.storage;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalFileStorage implements FileStorage {

    /** Корневая директория; можно переопределить свойством app.storage.local.dir */
    @Value("${app.storage.local.dir:${user.home}/uploads}")
    private String rootDir;

    private Path root;

    @PostConstruct
    void init() throws IOException { //проверка на существаование папки
        root = Path.of(rootDir);
        Files.createDirectories(root);
    }

    /** Сохраняем файл и возвращаем относительный «ключ» */
    @Override
    public String store(MultipartFile file, String subDir) throws IOException {
        String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());

        Path dir = root.resolve(subDir);
        Files.createDirectories(dir);

        Path target = dir.resolve(filename);
        try (var in = file.getInputStream()) {
            Files.copy(in, target);
        }
        return subDir + "/" + filename;            // ← key, который запишем в БД
    }

    /** Загружаем ресурс по относительному пути */
    @Override
    public Resource loadAsResource(String path) throws IOException {
        return new FileSystemResource(root.resolve(path));
    }

    /** Удаляем файл, если существует */
    @Override
    public void delete(String path) throws IOException {
        Files.deleteIfExists(root.resolve(path));
    }

    /* --- вспомогательные методы --- */

    private static String getExtension(String originalName) {
        int dot = originalName.lastIndexOf('.');
        return dot >= 0 ? originalName.substring(dot) : "";
    }
}
