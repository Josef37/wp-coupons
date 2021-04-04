<?php
namespace WPCoupons\Models;

class Coupon {
	/**
	 * The post id for the coupon custom post type.
	 *
	 * @var int
	 */
	public $coupon_id;

	public function __construct( $coupon_id ) {
		$this->coupon_id = $coupon_id;
	}

	/** @todo use minimum valid time option (e.g. at least two days before expiry) */
	public function is_retrievable() {
		return $this->is_active()
			&& $this->is_unused()
			&& $this->is_valid();
	}

	public function is_active() {
		return 'publish' === $this->get_status();
	}
	public function is_unused() {
		return empty( $this->get_user_id() );
	}
	public function is_valid() {
		$today  = date( 'Y-m-d' );
		$expire = $this->get_expires_at();

		return $today <= $expire;
	}

	public function get_value() {
		return get_the_title( $this->coupon_id );
	}
	public function get_group_id() {
		$terms = wp_get_object_terms(
			$this->coupon_id,
			CouponGroup::TAXONOMY_KEY,
			CouponGroup::TERM_QUERY_ARGS
		);
		return $terms[0];
	}
	public function get_user_id() {
		return get_post_meta( $this->coupon_id, 'user_id', true );
	}
	public function get_expires_at() {
		return get_post_meta( $this->coupon_id, 'expires_at', true );
	}
	public function get_status() {
		return get_post_status( $this->coupon_id );
	}

	/**
	 * Inserts a new Coupon into the database.
	 *
	 * @param array $args [
	 *   'value' => string,
	 *   'group_id' => int,
	 *   'expires_at => date in mysql format as string,
	 *   'status' => string
	 * ].
	 * @throws \Exception From `wp_insert_post`.
	 * @return int The post ID.
	 */
	public static function insert( $args ) {
		$defaults = array(
			'status' => 'publish',
		);

		list(
			'value'      => $value,
			'group_id'   => $group_id,
			'expires_at' => $expires_at,
			'status'     => $status,
		) = wp_parse_args( $args, $defaults );

		$postarr         = array(
			'post_title'  => $value,
			'post_status' => $status,
			'post_type'   => 'wp_coupon',
			'meta_input'  => array( 'expires_at' => $expires_at ),
		);
		$do_return_error = true;

		$post_id_or_error = wp_insert_post( $postarr, $do_return_error );

		if ( is_wp_error( $post_id_or_error ) ) {
			$error = $post_id_or_error;
			throw new \Exception( $error->get_error_message() );
		}

		$post_id = $post_id_or_error;

		// We can't use 'tax_input' when user does not have capabilities to work with taxonomies.
		$term_ids_or_error = wp_set_object_terms(
			$post_id,
			$group_id,
			CouponGroup::TAXONOMY_KEY
		);

		if ( is_wp_error( $term_ids_or_error ) ) {
			$error = $term_ids_or_error;
			throw new \Exception( $error->get_error_message() );
		}

		return $post_id;
	}

	/**
	 * Deletes the coupon and skips trash.
	 */
	public static function delete( $id ) {
		$skip_trash = true;
		wp_delete_post( $id, $skip_trash );
	}

	/**
	 * Registers the custom post type for Coupon.
	 */
	public static function register() {
		register_post_type(
			'wp_coupon',
			array(
				'label'                 => 'Coupons',
				'public'                => false,
				'hierarchical'          => false,
				'supports'              => array( 'title', 'editor', 'custom-fields', 'page-attributes' ),
				'rewrite'               => false,
				'show_in_rest'          => true,
				'rest_base'             => 'wp_coupon',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
			)
		);

		register_post_meta(
			'wp_coupon',
			'expires_at',
			array(
				'type'         => 'string',
				'description'  => 'Last day of coupon validity (in site\'s time-zone), stored in MySQL date format Y-m-d (e.g. 2020-12-24).',
				'single'       => true,
				'show_in_rest' => array(
					'schema' => array(
						'type'    => 'string',
						'pattern' => \WPCoupons\Utils::get_date_regex(),
					),
				),
			)
		);

		register_post_meta(
			'wp_coupon',
			'user_id',
			array(
				'type'         => 'number',
				'description'  => 'ID of user, who received the coupon.',
				'single'       => true,
				'show_in_rest' => true,
			)
		);
	}
}