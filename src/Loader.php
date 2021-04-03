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
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

		if ( is_admin() ) {
			$this->load_admin();
		} else {
			$this->load_frontend();
		}
	}

	public function register_models() {
		Models\Coupon::register();
		Models\CouponGroup::register();
		Models\User::register();
	}

	public function register_rest_routes() {
		$version   = 1;
		$namespace = $this->plugin_name . '/v' . $version;

		( new Routes\AddCouponsRoute( $namespace ) )->register_routes();
	}

	private function load_admin() {
		$react_assets_url = $this->plugin_root_url . 'src/Admin/view/build';
		$root_element_id  = 'wp-coupons-root';

		$asset_loader = new Admin\Menu\LiveAssetLoader( $react_assets_url );
		$menu         = new Admin\Menu\Menu( $root_element_id, $asset_loader );

		add_action( 'admin_menu', array( $menu, 'add_menu_page' ) );
	}

	private function load_frontend() {
		$this->init_controllers();
		$this->register_scripts();
	}

	private function init_controllers() {
		$popup_controller = new Controllers\PopupController();
		add_action( 'init', array( $popup_controller, 'init_popup' ) );
	}

	/** @todo Use dedicated loader? */
	private function register_scripts() {
		$assets_path = 'src/assets/';
		$assets_url  = $this->plugin_root_url . $assets_path;
		$assets_dir  = $this->plugin_root_dir . $assets_path;

		add_action(
			'init',
			function() use ( $assets_url, $assets_dir ) {
				$script_name = 'popup';
				wp_register_script(
					'wp-coupons-' . $script_name,
					$assets_url . $script_name . '.js',
					array(),
					filemtime( $assets_dir . $script_name . '.js' ),
					true
				);
			}
		);
	}
}
