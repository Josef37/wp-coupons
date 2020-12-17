import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import WpRest from "../api/wp-rest";

export const addGroup = createAsyncThunk(
	'coupons/addGroup',
	WpRest.addGroup
)

export const addCoupons = createAsyncThunk(
	'coupons/addCoupons',
	async ({ couponValues, expiresAt, groupId }) => {
		const couponIds = await WpRest.addCoupons({ couponValues, expiresAt, groupId })
		return {
			groupId,
			coupons: _.zipWith(couponIds, couponValues, (id, value) => ({ id, value, expiresAt }))
		}
	}
)

export const getGroups = createAsyncThunk(
	'coupons/getGroups',
	WpRest.getGroups
)

export const getCoupons = createAsyncThunk(
	'coupons/getCoupons',
	async (groupId) => ({
		groupId,
		coupons: await WpRest.getCoupons(groupId)
	})
)

/* {
	id: 123,
	name: "Special Christmas Offer",
	description: "50 % before christmas on everything",
	template: "Get your 50% offer today: %coupon%",
	isActive: true,
	couponIds: [123, 124, 125]
} */
const couponGroupsAdapter = createEntityAdapter()

/* {
	id: 123,
	value: "coupon1234",
	expiresAt: "2020-12-25"
} */
const couponsAdapter = createEntityAdapter()

const initialState = {
	couponGroups: couponGroupsAdapter.getInitialState(),
	coupons: couponsAdapter.getInitialState()
}

const couponsSlice = createSlice({
	name: 'coupons',
	initialState,
	reducers: {
		editGroup: (state, { payload: { groupId, ...changes } }) => {
			couponGroupsAdapter.updateOne(state.couponGroups, { id: groupId, changes })
		}
	},
	extraReducers: {
		[addGroup.fulfilled]: (state, { payload: couponGroup }) => {
			couponGroupsAdapter.addOne(state.couponGroups, couponGroup)
		},
		[addCoupons.fulfilled]: (state, { payload: { groupId, coupons } }) => {
			addCouponsToState(state, groupId, coupons)
		},
		[getGroups.fulfilled]: (state, { payload: couponGroups }) => {
			couponGroupsAdapter.setAll(state.couponGroups, couponGroups)
		},
		[getCoupons.fulfilled]: (state, { payload: { groupId, coupons } }) => {
			removeCouponsInGroup(state, groupId)
			addCouponsToState(state, groupId, coupons)
		},
	}
});

export const {
	selectById: selectCouponGroupById,
	selectIds: selectCouponGroupsIds
} = couponGroupsAdapter.getSelectors(state => state.coupons.couponGroups)
export const { selectById: selectCouponById } = couponsAdapter.getSelectors(state => state.coupons.coupons)

export const { editGroup } = couponsSlice.actions

export default couponsSlice.reducer

function addCouponsToState(state, groupId, coupons) {
	addCouponsToGroup(state, groupId, coupons);
	couponsAdapter.addMany(state.coupons, coupons);
}

function addCouponsToGroup(state, groupId, coupons) {
	const newCouponsIds = _.map(coupons, 'id');
	const currentCouponIds = state.couponGroups.entities[groupId].couponIds;
	const couponIds = _.union(currentCouponIds, newCouponsIds);

	couponGroupsAdapter.updateOne(state.couponGroups, {
		id: groupId,
		changes: { couponIds }
	});
}

function removeCouponsInGroup(state, groupId) {
	const coupons = state.couponGroups.entities[groupId].coupons
	const couponIds = _.map(coupons, 'id')
	couponGroupsAdapter.updateOne(state.couponGroups, { id: groupId, changes: { couponIds: [] } })
	couponsAdapter.removeMany(state.coupons, couponIds)
}
