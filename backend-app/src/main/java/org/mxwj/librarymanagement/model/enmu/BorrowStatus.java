package org.mxwj.librarymanagement.model.enmu;

public enum BorrowStatus {
    BORROWED((short)0, "借出"),
    RETURNED((short)1, "已还"),
    OVERDUE((short)2, "逾期"),
    LOST((short)3, "丢失/损坏");

    private final short value;
    private final String description;

    BorrowStatus(short value, String description) {
        this.value = value;
        this.description = description;
    }

    public short getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }
}

//TODO 在业务复杂后将魔法数字更换为枚举类