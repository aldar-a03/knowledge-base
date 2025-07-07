package com.example.itsupport.repository;

import com.example.itsupport.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository <Category, Long> {
    boolean existsByName(String name);
}
