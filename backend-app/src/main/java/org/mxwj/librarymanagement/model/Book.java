package org.mxwj.librarymanagement.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "book")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "isbn", unique = true, length = 20)
    private String isbn; // ISBN

    @Column(name = "title", nullable = false, length = 255)
    private String title; 

    @Column(name = "author", length = 100)
    private String author; // 作者

    @Column(name = "publisher", length = 100)
    private String publisher; // 出版社

    @Column(name = "publish_date")
    private LocalDate publishDate; // 出版日期

    @Column(name = "category", length = 50)
    private String category; // 分类

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // 简介

    @Column(name = "total_copies", columnDefinition = "INT DEFAULT 1")
    private Integer totalCopies = 1; // 总册数 

    @Column(name = "available_copies", columnDefinition = "INT DEFAULT 1")
    private Integer availableCopies = 1; // 可借册数

    @Column(name = "location", length = 50)
    private String location; // 馆藏位置

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime updatedAt;

    // 关系：一个 Book 可以有多条 BorrowRecord
    @OneToMany(mappedBy = "book") 
    private Set<BorrowRecord> borrowRecords;
}
