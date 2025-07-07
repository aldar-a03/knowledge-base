package com.example.itsupport.repository;

import com.example.itsupport.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    Page<Material> findByCategories_Id(Long categoryId, Pageable pageable);

    Page<Material> findByUserId(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    @Query(value = """
            SELECT 
                m.id,
                m.title,
                ts_headline('russian', m.content, tsq, 'StartSel=<b>,StopSel=</b>, ' || 'MaxFragments=2, MinWords=10, MaxWords=25') AS snippet,
                u.full_name,
                m.created_at
            FROM material m
            JOIN users u ON m.id_user = u.id,
                 plainto_tsquery('russian', :q) tsq
            WHERE m.search_vector @@ tsq
            ORDER BY ts_rank(m.search_vector, tsq) DESC,
                     m.created_at DESC
            """,
            countQuery = """
                    SELECT count(*)
                    FROM material m
                    JOIN users u ON m.id_user = u.id,
                         plainto_tsquery('russian', :q) tsq
                    WHERE m.search_vector @@ tsq
                    """,
            nativeQuery = true)
    Page<Object[]> fullTextSearch(@Param("q") String q, Pageable pageable);

    @Query(value = """
            SELECT array_agg(lexeme)
            FROM   ts_stat(plainto_tsquery('russian', :q))
            """,
            nativeQuery = true)
    String[] extractLexemes(@Param("q") String q);

    @Query(value = """
    SELECT word
    FROM dict_lexemes
    WHERE word % :token
    ORDER BY similarity(word, :token) DESC
    LIMIT 1
    """, nativeQuery = true)
    String suggestClosest(@Param("token") String token);

}


