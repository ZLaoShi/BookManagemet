package org.mxwj.librarymanagement.lib;

import org.hibernate.reactive.mutiny.Mutiny;
import static jakarta.persistence.Persistence.createEntityManagerFactory;

public class DatabaseManager {
    private static volatile Mutiny.SessionFactory INSTANCE;
    
    private DatabaseManager() {} 
    
    public static Mutiny.SessionFactory getSessionFactory() {
        if (INSTANCE == null) {
            synchronized (DatabaseManager.class) {
                if (INSTANCE == null) {
                    INSTANCE = createEntityManagerFactory("pg-vertx-study")
                            .unwrap(Mutiny.SessionFactory.class);
                }
            }
        }
        return INSTANCE;
    }
}
