package org.mxwj.librarymanagement.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BorrowRecordsPage {
    private List<BorrowRecord> content;
    private PageInfo pageInfo;
}
