package com.example.itsupport.controller;

import com.example.itsupport.dto.attachment.AttachmentDto;
import com.example.itsupport.dto.attachment.ResourceWithMeta;
import com.example.itsupport.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.http.HttpHeaders.CONTENT_DISPOSITION;
import static org.springframework.http.HttpHeaders.CONTENT_TYPE;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialAttachmentController {
    private final AttachmentService service;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping(value = "/{id}/attachments", consumes = MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Загрузить файл")
    public List<AttachmentDto> upload(@PathVariable Long id, @RequestPart("files") MultipartFile[] files) {
        return Arrays.stream(files)
                .map(f -> service.upload(id, f))
                .map(AttachmentDto::from)
                .toList();
    }

    @GetMapping("/attachments/{uuid}")
    @Operation(summary = "Скачать файл")
    public ResponseEntity<Resource> download(@PathVariable UUID uuid) {
        var res = service.download(uuid);
        return ResponseEntity.ok()
                .header(CONTENT_TYPE, res.meta().getContentType())
                .header(CONTENT_DISPOSITION,
                        "attachment; filename=\"%s\"".formatted(
                                UriUtils.encode(res.meta().getOriginalName(), UTF_8)))
                .body(res.resource());
    }

    @DeleteMapping("/attachments/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<String> deleteAttachment(@PathVariable UUID id) {
        String msg = service.deleteAttachment(id);
        return ResponseEntity.ok(msg);
    }
}

