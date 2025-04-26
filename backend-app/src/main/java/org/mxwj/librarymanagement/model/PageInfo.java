package org.mxwj.librarymanagement.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageInfo {
    private int currentPage;
    private int pageSize;
    private int totalPages;
    private int totalElements;
    private boolean hasNext;
}
