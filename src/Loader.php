<?php
namespace WPCoupons;

/**
 * Bootstraps the plugin.
 */
class Loader {
	private $plugin_version;
	private $plugin_root_dir;
	private $plugin_root_url;
	private $plugin_name;

	/**
	 * Sets up plugin constants.
	 */
	public function __construct( $plugin_version, $plugin_root_dir, $plugin_root_url ) {
		$this->plugin_version  = $plugin_version;
		$this->plugin_root_dir = $plugin_root_dir;
		$this->plugin_root_url = $plugin_root_url;
		$this->plugin_name     = 'wp-coupons';
	}

	/**
	 * Loads everything neccessary for the plugin.
	 */
	public function run() {
		add_action( 'init', array( $this, 'register_models' ) );
		$this->maybe_load_admin();
		$this->maybe_load_frontend();
	}

	public function register_models() {
		Model\Coupon::register();
		Model\CouponGroup::register();
		Model\User::register();
	}

	private function maybe_load_admin() {
		if ( is_admin() ) {
			$this->load_admin();
		}
	}

	private function load_admin() {
		$react_assets_url = $this->plugin_root_url . 'src/Admin/view/build';
		$root_element_id  = 'wp-coupons-root';
		$menu             = new Admin\Menu( $react_assets_url, $root_element_id );

		add_action( 'admin_menu', array( $menu, 'add_menu_page' ) );
	}

	private function maybe_load_frontend() {
		if ( ! is_admin() ) {
			$this->load_frontend();
		}
	}

	private function load_frontend() {

	}
}
