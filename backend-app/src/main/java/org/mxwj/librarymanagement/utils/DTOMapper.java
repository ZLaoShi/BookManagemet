package org.mxwj.librarymanagement.utils;

import java.lang.reflect.Field;
import java.util.Map;

public class DTOMapper {
    
    public static <T> T mapToDTO(Map<String, Object> input, Class<T> dtoClass) {
        try {
            T dto = dtoClass.getDeclaredConstructor().newInstance();
            
            for (Field field : dtoClass.getDeclaredFields()) {
                field.setAccessible(true);
                String fieldName = field.getName();
                Object value = input.get(fieldName);
                
                if (value != null) {
                    setFieldValue(field, dto, value);
                }
            }
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("DTO映射失败", e);
        }
    }
    
    private static <T> void setFieldValue(Field field, T dto, Object value) throws IllegalAccessException {
        Class<?> fieldType = field.getType();
        
        // 处理基本类型转换
        switch (fieldType.getName()) {
            case "java.lang.String":
                field.set(dto, String.valueOf(value));
                break;
                
            case "java.lang.Integer":
                if (value instanceof String) {
                    field.set(dto, Integer.valueOf((String) value));
                } else if (value instanceof Integer) {
                    field.set(dto, value);
                }
                break;
                
            case "java.lang.Long":
                if (value instanceof String) {
                    field.set(dto, Long.valueOf((String) value));
                } else if (value instanceof Integer) {
                    field.set(dto, ((Integer) value).longValue());
                }
                break;
                
            case "java.lang.Short":
                if (value instanceof String) {
                    field.set(dto, Short.valueOf((String) value));
                } else if (value instanceof Integer) {
                    field.set(dto, ((Integer) value).shortValue());
                }
                break;
                
            case "java.time.LocalDate":
                if (value instanceof String) {
                    field.set(dto, value);
                }
                break;
                
            case "java.time.OffsetDateTime":
                if (value instanceof String) {
                    field.set(dto, value);
                }
                break;
                
            default:
                System.err.println("未处理的类型: " + fieldType.getName() + ", 字段: " + field.getName());
                break;
        }
    }
}