package org.mxwj.librarymanagement.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserInfoDTO {
    private Long accountId;
    private String fullName;
    private String phone;
    private String address;
    private Integer maxBorrowBooks;
}
