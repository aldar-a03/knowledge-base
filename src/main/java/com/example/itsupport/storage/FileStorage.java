package com.example.itsupport.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorage {
    String store(MultipartFile file, String subDir) throws IOException;

    Resource loadAsResource(String path) throws IOException;

    void delete(String path) throws IOException;
}
