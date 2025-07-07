package com.example.itsupport.storage;

import io.minio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

import static org.apache.commons.io.FilenameUtils.getExtension;

@Component
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
@RequiredArgsConstructor
public class MinioFileStorage implements FileStorage {

    @Value("${app.storage.s3.bucket}")        private String bucket;
    private final MinioClient client;

    @Override
    public String store(MultipartFile file, String subDir) throws IOException {
        String objectName = subDir + "/" + UUID.randomUUID() + getExtension(file.getOriginalFilename());
        try {
            client.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {                    // ловим всё, что кидает MinIO
            throw new IOException("Не удалось загрузить файл в MinIO", e);
        }
    }

    @Override
    public Resource loadAsResource(String path) throws IOException {
        try {
            GetObjectResponse stream = client.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(path).build());
            return new InputStreamResource(stream);
        } catch (Exception e) {
            throw new IOException("Не удалось скачать файл из MinIO", e);
        }
    }

    @Override
    public void delete(String path) throws IOException {
        try {
            client.removeObject(
                    RemoveObjectArgs.builder().bucket(bucket).object(path).build());
        } catch (Exception e) {
            throw new IOException("Не удалось удалить файл из MinIO", e);
        }
    }

}
