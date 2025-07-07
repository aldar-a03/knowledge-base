package com.example.itsupport.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attachment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(nullable = false)
    private Material material;

    private String path;
    private String originalName;
    private long   size;
    private String contentType;
    private Instant createdAt;
}