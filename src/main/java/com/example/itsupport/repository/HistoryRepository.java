package com.example.itsupport.repository;

import com.example.itsupport.entity.History;
import com.example.itsupport.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
}
