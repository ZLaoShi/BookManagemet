package org.mxwj.librarymanagement.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookDTO {
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private String publishDate;  
    private String category;
    private String description;
    private Integer totalCopies;
    private String location;
}
