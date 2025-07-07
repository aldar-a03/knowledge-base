package com.example.itsupport.repository;

import com.example.itsupport.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    //Получить все вложения конкретного материала
    List<Attachment> findByMaterialId(Long materialId);

    void deleteByMaterialId(Long materialId);
}

