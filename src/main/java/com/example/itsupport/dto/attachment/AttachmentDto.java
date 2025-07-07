package com.example.itsupport.dto.attachment;

import com.example.itsupport.entity.Attachment;

import java.util.UUID;

public record AttachmentDto(
        UUID id,
        String originalName,
        long size,
        String contentType
) {
    public static AttachmentDto from(Attachment a) {
        return new AttachmentDto(
                a.getId(),
                a.getOriginalName(),
                a.getSize(),
                a.getContentType()
        );
    }
}

