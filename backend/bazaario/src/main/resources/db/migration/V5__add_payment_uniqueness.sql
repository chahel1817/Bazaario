ALTER TABLE payments ADD CONSTRAINT uc_transaction_id UNIQUE (transaction_id);
