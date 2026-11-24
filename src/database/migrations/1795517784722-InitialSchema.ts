import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795517784722 implements MigrationInterface {
    name = 'InitialSchema1795517784722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`payment_method\` enum ('GCash', 'Maya', 'Bank Transfer') NOT NULL, \`payment_reference\` varchar(150) NULL, \`amount\` decimal(10,2) NOT NULL, \`payment_status\` enum ('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`order_id\` int UNSIGNED NOT NULL, INDEX \`IDX_payments_order_id\` (\`order_id\`), UNIQUE INDEX \`IDX_07273ea3fb0e3f0add915cf563\` (\`payment_reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shipments\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`courier_name\` varchar(50) NOT NULL, \`tracking_number\` varchar(100) NULL, \`shipping_status\` enum ('Pending', 'Shipped', 'In Transit', 'Delivered') NOT NULL DEFAULT 'Pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`order_id\` int UNSIGNED NOT NULL, UNIQUE INDEX \`IDX_e148d569550cfa0295ccf23706\` (\`tracking_number\`), UNIQUE INDEX \`REL_e86fac2a18a75dcb82bfbb23f4\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reviews\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`rating\` tinyint UNSIGNED NOT NULL, \`comment\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`order_id\` int UNSIGNED NOT NULL, \`reviewer_id\` int UNSIGNED NOT NULL, UNIQUE INDEX \`REL_e4b0ed40bdd0f318108612c285\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`order_date\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`total_amount\` decimal(10,2) NOT NULL, \`delivery_address\` text NOT NULL, \`order_status\` enum ('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`buyer_id\` int UNSIGNED NOT NULL, \`product_id\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trades\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`trade_status\` enum ('Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`offered_product_id\` int UNSIGNED NOT NULL, \`requested_product_id\` int UNSIGNED NOT NULL, \`proposer_id\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`artist_name\` varchar(150) NOT NULL, \`product_name\` varchar(150) NOT NULL, \`category\` varchar(50) NOT NULL, \`item_condition\` varchar(50) NOT NULL, \`description\` text NOT NULL, \`price\` decimal(10,2) NOT NULL, \`image_url\` varchar(2048) NULL, \`product_status\` enum ('Available', 'Reserved', 'Sold', 'Traded') NOT NULL DEFAULT 'Available', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`seller_id\` int UNSIGNED NOT NULL, INDEX \`IDX_products_status_category\` (\`product_status\`, \`category\`), INDEX \`IDX_products_seller_id\` (\`seller_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`full_name\` varchar(100) NOT NULL, \`email\` varchar(150) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`location\` varchar(150) NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`messages\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`message_content\` text NOT NULL, \`sent_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sender_id\` int UNSIGNED NOT NULL, \`receiver_id\` int UNSIGNED NOT NULL, INDEX \`IDX_messages_sender_receiver_sent_at\` (\`sender_id\`, \`receiver_id\`, \`sent_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // CHECK constraints for Himig database rules
        await queryRunner.query(`
            ALTER TABLE \`products\`
            ADD CONSTRAINT \`CHK_products_price_nonnegative\`
            CHECK (\`price\` >= 0)
        `);

        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`CHK_orders_total_nonnegative\`
            CHECK (\`total_amount\` >= 0)
        `);

        await queryRunner.query(`
            ALTER TABLE \`payments\`
            ADD CONSTRAINT \`CHK_payments_amount_positive\`
            CHECK (\`amount\` > 0)
        `);

        await queryRunner.query(`
            ALTER TABLE \`reviews\`
            ADD CONSTRAINT \`CHK_reviews_rating_range\`
            CHECK (\`rating\` BETWEEN 1 AND 5)
        `);

        await queryRunner.query(`
            ALTER TABLE \`trades\`
            ADD CONSTRAINT \`CHK_trades_different_products\`
            CHECK (\`offered_product_id\` <> \`requested_product_id\`)
        `);

        // Foreign keys
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_b2f7b823a21562eeca20e72b006\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shipments\` ADD CONSTRAINT \`FK_e86fac2a18a75dcb82bfbb23f43\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_e4b0ed40bdd0f318108612c2851\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_92e950a2513a79bb3fab273c92e\` FOREIGN KEY (\`reviewer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_5e90e93d0e036c3fadbaefa4d0a\` FOREIGN KEY (\`buyer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_ac832121b6c331b084ecc4121fd\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trades\` ADD CONSTRAINT \`FK_7edc7cbaf8718ab077104ce171c\` FOREIGN KEY (\`offered_product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trades\` ADD CONSTRAINT \`FK_14b78dd4999303960cecc8897fa\` FOREIGN KEY (\`requested_product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trades\` ADD CONSTRAINT \`FK_26c690c2757bedd5761af4d9b8d\` FOREIGN KEY (\`proposer_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_425ee27c69d6b8adc5d6475dcfe\` FOREIGN KEY (\`seller_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_22133395bd13b970ccd0c34ab22\` FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_b561864743d235f44e70addc1f5\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove CHECK constraints before dropping tables
        await queryRunner.query(`ALTER TABLE \`trades\` DROP CHECK \`CHK_trades_different_products\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP CHECK \`CHK_reviews_rating_range\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP CHECK \`CHK_payments_amount_positive\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP CHECK \`CHK_orders_total_nonnegative\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP CHECK \`CHK_products_price_nonnegative\``);

        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_b561864743d235f44e70addc1f5\``);
        await queryRunner.query(`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_22133395bd13b970ccd0c34ab22\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_425ee27c69d6b8adc5d6475dcfe\``);
        await queryRunner.query(`ALTER TABLE \`trades\` DROP FOREIGN KEY \`FK_26c690c2757bedd5761af4d9b8d\``);
        await queryRunner.query(`ALTER TABLE \`trades\` DROP FOREIGN KEY \`FK_14b78dd4999303960cecc8897fa\``);
        await queryRunner.query(`ALTER TABLE \`trades\` DROP FOREIGN KEY \`FK_7edc7cbaf8718ab077104ce171c\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_ac832121b6c331b084ecc4121fd\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_5e90e93d0e036c3fadbaefa4d0a\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_92e950a2513a79bb3fab273c92e\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_e4b0ed40bdd0f318108612c2851\``);
        await queryRunner.query(`ALTER TABLE \`shipments\` DROP FOREIGN KEY \`FK_e86fac2a18a75dcb82bfbb23f43\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_b2f7b823a21562eeca20e72b006\``);

        // Drop indexes and tables
        await queryRunner.query(`DROP INDEX \`IDX_messages_sender_receiver_sent_at\` ON \`messages\``);
        await queryRunner.query(`DROP TABLE \`messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_products_seller_id\` ON \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_products_status_category\` ON \`products\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`trades\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP INDEX \`REL_e4b0ed40bdd0f318108612c285\` ON \`reviews\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP INDEX \`REL_e86fac2a18a75dcb82bfbb23f4\` ON \`shipments\``);
        await queryRunner.query(`DROP INDEX \`IDX_e148d569550cfa0295ccf23706\` ON \`shipments\``);
        await queryRunner.query(`DROP TABLE \`shipments\``);
        await queryRunner.query(`DROP INDEX \`IDX_07273ea3fb0e3f0add915cf563\` ON \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_payments_order_id\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
    }
}