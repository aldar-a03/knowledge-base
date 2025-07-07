package com.example.itsupport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "material")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @ManyToMany
    @JoinTable(
            name = "material_category",
            joinColumns = @JoinColumn(name = "id_material"),
            inverseJoinColumns = @JoinColumn(name = "id_category")
    )

    private List<Category> categories;

    @OneToMany(
            mappedBy = "material",
            cascade = CascadeType.ALL,     // PERSIST, REMOVE и т. д.
            orphanRemoval = true           // удаляет Attachment, если он исключён из коллекции
    )
    private List<Attachment> attachments = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne //у одного Material может быть один user, а один User может иметь много Material.
    @JoinColumn(name = "id_user", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime timeInsert;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
