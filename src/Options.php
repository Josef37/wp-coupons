<?php

namespace WPCoupons;

class Options {
	const OPTION_NAME = 'wp_coupons_options';
	public static $default_options;

	public static function init_static() {
		self::$default_options = array(
			'seconds_between_any_popup'      => strtotime( '1 day', 0 ),
			'seconds_between_same_popup'     => strtotime( '7 days', 0 ),
			'seconds_between_any_retrieval'  => strtotime( '7 days', 0 ),
			'seconds_between_same_retrieval' => strtotime( '30 days', 0 ),
		);
	}

	public static function get_options() {
		$options = get_option( self::OPTION_NAME, array() );
		return array_merge( self::$default_options, $options );
	}

	public static function get_option( $key ) {
		$options = self::get_options();
		return $options[ $key ];
	}

	public static function set_options( $options ) {
		update_option( self::OPTION_NAME, $options );
	}

	public static function set_option( $key, $option ) {
		$current_options = self::get_options();
		$new_options     = array_merge( $current_options, array( $key => $option ) );
		self::set_options( $new_options );
	}
}

Options::init_static();